/**
 * Automated Anomaly Explanation System with Claude
 * Detects, analyzes, and explains anomalies in facility data
 */

import { ClaudeVibeLuxAssistant } from './claude-integration';
import { cropDatabase } from './comprehensive-crop-database';
import { researchVerificationSystem } from './research-verification-system';

export interface Anomaly {
  id: string;
  timestamp: Date;
  type: AnomalyType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  metric: string;
  value: number;
  expectedRange: {
    min: number;
    max: number;
    mean: number;
    stdDev: number;
  };
  deviation: {
    sigmas: number;
    percentageFromMean: number;
    direction: 'above' | 'below';
  };
  location?: {
    zone?: string;
    equipment?: string;
    sensor?: string;
  };
  duration: number; // minutes
  frequency: number; // occurrences in past 24h
}

export enum AnomalyType {
  ENVIRONMENTAL = 'environmental',
  EQUIPMENT = 'equipment',
  CROP_HEALTH = 'crop_health',
  ENERGY = 'energy',
  WATER = 'water',
  NUTRIENT = 'nutrient',
  OPERATIONAL = 'operational',
  SECURITY = 'security'
}

export interface AnomalyExplanation {
  anomalyId: string;
  summary: string;
  detailedExplanation: string;
  possibleCauses: Cause[];
  correlatedFactors: CorrelatedFactor[];
  impactAssessment: ImpactAssessment;
  recommendedActions: Action[];
  historicalContext: HistoricalContext;
  confidenceLevel: number;
  scientificBacking?: {
    sources: string[];
    relevantStudies: string[];
  };
}

export interface Cause {
  id: string;
  description: string;
  probability: number;
  category: 'equipment' | 'environmental' | 'human' | 'biological' | 'systematic';
  evidenceSupport: string[];
  testingRequired: boolean;
  testingSuggestions?: string[];
}

export interface CorrelatedFactor {
  metric: string;
  correlation: number;
  timeOffset: number; // minutes before/after anomaly
  description: string;
  causalityLikelihood: 'high' | 'medium' | 'low';
}

export interface ImpactAssessment {
  cropImpact: {
    affected: boolean;
    severity: 'none' | 'minimal' | 'moderate' | 'severe';
    specificEffects: string[];
    recoveryTime?: string;
  };
  operationalImpact: {
    downtime: number; // minutes
    efficiency: number; // percentage impact
    cascadeRisk: boolean;
    affectedSystems: string[];
  };
  financialImpact: {
    estimatedCost: number;
    revenueRisk: number;
    confidenceRange: {
      min: number;
      max: number;
    };
  };
  complianceImpact: {
    regulatoryRisk: boolean;
    affectedStandards: string[];
    reportingRequired: boolean;
  };
}

export interface Action {
  id: string;
  priority: 'immediate' | 'urgent' | 'scheduled' | 'monitoring';
  title: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  requiredResources: string[];
  skillLevel: 'basic' | 'intermediate' | 'expert';
  preventsFuture: boolean;
  successMetrics: string[];
}

export interface HistoricalContext {
  previousOccurrences: number;
  lastOccurrence?: Date;
  trend: 'increasing' | 'stable' | 'decreasing' | 'new';
  seasonalPattern: boolean;
  relatedIncidents: string[];
  resolutionHistory: {
    successfulActions: string[];
    averageResolutionTime: number;
  };
}

export class AnomalyExplanationSystem {
  private claudeAssistant: ClaudeVibeLuxAssistant;
  private anomalyHistory: Map<string, Anomaly[]>;
  private explanationCache: Map<string, AnomalyExplanation>;

  constructor() {
    this.claudeAssistant = new ClaudeVibeLuxAssistant();
    this.anomalyHistory = new Map();
    this.explanationCache = new Map();
  }

  /**
   * Detect anomalies in sensor data
   */
  async detectAnomalies(
    sensorData: any[],
    facilityId: string,
    cropType: string
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Group sensor data by type and location
    const groupedData = this.groupSensorData(sensorData);
    
    // Analyze each metric for anomalies
    for (const [key, dataPoints] of groupedData.entries()) {
      const stats = this.calculateStatistics(dataPoints);
      const cropRequirements = await this.getCropRequirements(cropType, key);
      
      // Check for statistical anomalies
      for (const point of dataPoints) {
        const deviation = Math.abs(point.value - stats.mean) / stats.stdDev;
        
        // Check if outside normal range (3-sigma rule or crop requirements)
        if (deviation > 3 || !this.isWithinCropRequirements(point.value, cropRequirements)) {
          const anomaly: Anomaly = {
            id: `anomaly_${Date.now()}_${Math.random()}`,
            timestamp: point.timestamp,
            type: this.classifyAnomalyType(key),
            severity: this.calculateSeverity(deviation, cropRequirements, point.value),
            metric: key,
            value: point.value,
            expectedRange: {
              min: cropRequirements?.min || stats.mean - 3 * stats.stdDev,
              max: cropRequirements?.max || stats.mean + 3 * stats.stdDev,
              mean: stats.mean,
              stdDev: stats.stdDev
            },
            deviation: {
              sigmas: deviation,
              percentageFromMean: ((point.value - stats.mean) / stats.mean) * 100,
              direction: point.value > stats.mean ? 'above' : 'below'
            },
            location: point.location,
            duration: this.calculateAnomalyDuration(dataPoints, point, stats),
            frequency: this.countRecentOccurrences(key, facilityId)
          };
          
          anomalies.push(anomaly);
        }
      }
    }
    
    // Store anomalies in history
    this.updateAnomalyHistory(facilityId, anomalies);
    
    return anomalies;
  }

  /**
   * Generate intelligent explanation for anomaly
   */
  async explainAnomaly(
    anomaly: Anomaly,
    facilityData: any,
    cropType: string
  ): Promise<AnomalyExplanation> {
    // Check cache first
    const cached = this.explanationCache.get(anomaly.id);
    if (cached) return cached;

    console.log(`Generating explanation for ${anomaly.type} anomaly: ${anomaly.metric}`);

    // Gather context for analysis
    const context = await this.gatherAnomalyContext(anomaly, facilityData);
    
    // Generate explanation using Claude
    const explanation = await this.generateClaudeExplanation(anomaly, context, cropType);
    
    // Analyze correlations
    const correlatedFactors = await this.findCorrelatedFactors(anomaly, facilityData);
    
    // Assess impact
    const impactAssessment = await this.assessImpact(anomaly, cropType, facilityData);
    
    // Generate recommendations
    const recommendedActions = await this.generateRecommendations(anomaly, explanation, impactAssessment);
    
    // Get historical context
    const historicalContext = this.getHistoricalContext(anomaly, facilityData.id);

    const fullExplanation: AnomalyExplanation = {
      anomalyId: anomaly.id,
      summary: explanation.summary,
      detailedExplanation: explanation.detailed,
      possibleCauses: explanation.causes,
      correlatedFactors,
      impactAssessment,
      recommendedActions,
      historicalContext,
      confidenceLevel: explanation.confidence,
      scientificBacking: await this.getScientificBacking(anomaly, cropType)
    };

    // Cache the explanation
    this.explanationCache.set(anomaly.id, fullExplanation);

    return fullExplanation;
  }

  /**
   * Generate Claude-powered explanation
   */
  private async generateClaudeExplanation(
    anomaly: Anomaly,
    context: any,
    cropType: string
  ): Promise<any> {
    const prompt = `
    Analyze this anomaly in a ${cropType} cultivation facility:

    ANOMALY DETAILS:
    - Type: ${anomaly.type}
    - Metric: ${anomaly.metric}
    - Value: ${anomaly.value} (expected: ${anomaly.expectedRange.min}-${anomaly.expectedRange.max})
    - Deviation: ${anomaly.deviation.sigmas.toFixed(1)} standard deviations ${anomaly.deviation.direction} normal
    - Duration: ${anomaly.duration} minutes
    - Severity: ${anomaly.severity}
    - Location: ${anomaly.location?.zone || 'General'} - ${anomaly.location?.equipment || 'Unknown'}

    ENVIRONMENTAL CONTEXT:
    ${JSON.stringify(context.environmental, null, 2)}

    RECENT EVENTS:
    ${context.recentEvents.map((e: any) => `- ${e.timestamp}: ${e.description}`).join('\n')}

    Please provide:
    1. A concise summary (1-2 sentences) explaining what happened
    2. A detailed explanation of the anomaly including technical details
    3. List of possible causes ranked by probability, with evidence
    4. Specific effects on ${cropType} cultivation
    5. Whether this requires immediate attention

    Consider:
    - Equipment failure patterns
    - Environmental interactions
    - Biological responses
    - Cascade effects
    - Safety implications

    Format response for technical staff managing the facility.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData: context.facility,
        sensorData: context.recentData,
        userRole: 'TECHNICIAN',
        timeframe: '24h'
      });

      return this.parseClaudeExplanation(response.answer, anomaly);

    } catch (error) {
      console.error('Error generating Claude explanation:', error);
      return this.generateFallbackExplanation(anomaly);
    }
  }

  /**
   * Find correlated factors
   */
  private async findCorrelatedFactors(
    anomaly: Anomaly,
    facilityData: any
  ): Promise<CorrelatedFactor[]> {
    const correlations: CorrelatedFactor[] = [];
    const timeWindow = 60 * 60 * 1000; // 1 hour before/after
    
    // Get all sensor data around anomaly time
    const nearbyData = facilityData.sensorReadings.filter((reading: any) => {
      const timeDiff = Math.abs(reading.timestamp.getTime() - anomaly.timestamp.getTime());
      return timeDiff <= timeWindow;
    });

    // Group by metric
    const metrics = new Map<string, any[]>();
    nearbyData.forEach((reading: any) => {
      const existing = metrics.get(reading.type) || [];
      existing.push(reading);
      metrics.set(reading.type, existing);
    });

    // Calculate correlations
    for (const [metric, readings] of metrics.entries()) {
      if (metric === anomaly.metric) continue;
      
      const correlation = this.calculateCorrelation(anomaly, readings);
      if (Math.abs(correlation) > 0.5) {
        correlations.push({
          metric,
          correlation,
          timeOffset: this.calculateTimeOffset(anomaly, readings),
          description: this.describeCorrelation(metric, correlation, anomaly),
          causalityLikelihood: Math.abs(correlation) > 0.8 ? 'high' : Math.abs(correlation) > 0.65 ? 'medium' : 'low'
        });
      }
    }

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Assess impact of anomaly
   */
  private async assessImpact(
    anomaly: Anomaly,
    cropType: string,
    facilityData: any
  ): Promise<ImpactAssessment> {
    const cropData = cropDatabase.searchVarieties({ commonName: cropType })[0];
    
    // Crop impact assessment
    const cropImpact = this.assessCropImpact(anomaly, cropData);
    
    // Operational impact
    const operationalImpact = this.assessOperationalImpact(anomaly, facilityData);
    
    // Financial impact
    const financialImpact = this.assessFinancialImpact(anomaly, cropImpact, operationalImpact);
    
    // Compliance impact
    const complianceImpact = this.assessComplianceImpact(anomaly);

    return {
      cropImpact,
      operationalImpact,
      financialImpact,
      complianceImpact
    };
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    anomaly: Anomaly,
    explanation: any,
    impact: ImpactAssessment
  ): Promise<Action[]> {
    const actions: Action[] = [];

    // Immediate actions for critical anomalies
    if (anomaly.severity === 'critical' || impact.cropImpact.severity === 'severe') {
      actions.push({
        id: 'immediate_response',
        priority: 'immediate',
        title: 'Emergency Response Required',
        description: `Critical ${anomaly.metric} anomaly requires immediate intervention`,
        steps: this.generateEmergencySteps(anomaly),
        estimatedTime: '15-30 minutes',
        requiredResources: ['On-call technician', 'Emergency toolkit'],
        skillLevel: 'expert',
        preventsFuture: false,
        successMetrics: [`${anomaly.metric} within normal range`, 'No crop damage']
      });
    }

    // Diagnostic actions
    if (explanation.causes.some((c: any) => c.testingRequired)) {
      actions.push({
        id: 'diagnostic_testing',
        priority: 'urgent',
        title: 'Diagnostic Testing Required',
        description: 'Perform tests to identify root cause',
        steps: this.generateDiagnosticSteps(anomaly, explanation.causes),
        estimatedTime: '1-2 hours',
        requiredResources: ['Testing equipment', 'Trained technician'],
        skillLevel: 'intermediate',
        preventsFuture: true,
        successMetrics: ['Root cause identified', 'Corrective action plan created']
      });
    }

    // Preventive actions
    if (anomaly.frequency > 3) {
      actions.push({
        id: 'preventive_maintenance',
        priority: 'scheduled',
        title: 'Implement Preventive Measures',
        description: 'Recurring issue requires systematic prevention',
        steps: this.generatePreventiveSteps(anomaly),
        estimatedTime: '4-8 hours',
        requiredResources: ['Maintenance team', 'Replacement parts'],
        skillLevel: 'intermediate',
        preventsFuture: true,
        successMetrics: ['Reduced anomaly frequency', 'Improved system reliability']
      });
    }

    return actions;
  }

  // Helper methods
  private groupSensorData(sensorData: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();
    
    sensorData.forEach(reading => {
      const key = `${reading.type}_${reading.location?.zone || 'general'}`;
      const existing = grouped.get(key) || [];
      existing.push(reading);
      grouped.set(key, existing);
    });
    
    return grouped;
  }

  private calculateStatistics(dataPoints: any[]): any {
    const values = dataPoints.map(p => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, stdDev, min: Math.min(...values), max: Math.max(...values) };
  }

  private async getCropRequirements(cropType: string, metric: string): Promise<any> {
    const varieties = cropDatabase.searchVarieties({ commonName: cropType });
    if (varieties.length === 0) return null;
    
    const variety = varieties[0];
    const metricMap: Record<string, string> = {
      temperature: 'temperatureRange',
      humidity: 'humidityRange',
      co2: 'co2Optimal',
      light: 'ppfdRange'
    };
    
    const requirement = variety.climate[metricMap[metric.split('_')[0]]];
    return requirement || null;
  }

  private isWithinCropRequirements(value: number, requirements: any): boolean {
    if (!requirements) return true;
    
    if (typeof requirements === 'number') {
      return Math.abs(value - requirements) / requirements < 0.2; // 20% tolerance
    }
    
    return value >= requirements.min && value <= requirements.max;
  }

  private classifyAnomalyType(metric: string): AnomalyType {
    const typeMap: Record<string, AnomalyType> = {
      temperature: AnomalyType.ENVIRONMENTAL,
      humidity: AnomalyType.ENVIRONMENTAL,
      co2: AnomalyType.ENVIRONMENTAL,
      light: AnomalyType.ENVIRONMENTAL,
      pump: AnomalyType.EQUIPMENT,
      fan: AnomalyType.EQUIPMENT,
      power: AnomalyType.ENERGY,
      water_flow: AnomalyType.WATER,
      ec: AnomalyType.NUTRIENT,
      ph: AnomalyType.NUTRIENT
    };
    
    const metricType = metric.split('_')[0];
    return typeMap[metricType] || AnomalyType.OPERATIONAL;
  }

  private calculateSeverity(
    deviation: number, 
    cropRequirements: any, 
    value: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    // Critical if way outside crop requirements
    if (cropRequirements) {
      const range = cropRequirements.max - cropRequirements.min;
      if (value < cropRequirements.min - range * 0.5 || value > cropRequirements.max + range * 0.5) {
        return 'critical';
      }
    }
    
    // Based on statistical deviation
    if (deviation > 5) return 'critical';
    if (deviation > 4) return 'high';
    if (deviation > 3) return 'medium';
    return 'low';
  }

  private calculateAnomalyDuration(dataPoints: any[], anomalyPoint: any, stats: any): number {
    let duration = 0;
    const threshold = stats.mean + 3 * stats.stdDev;
    
    // Find continuous period of anomalous values
    const sortedPoints = dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const anomalyIndex = sortedPoints.findIndex(p => p.timestamp === anomalyPoint.timestamp);
    
    // Check forward
    for (let i = anomalyIndex; i < sortedPoints.length - 1; i++) {
      if (Math.abs(sortedPoints[i].value - stats.mean) / stats.stdDev > 3) {
        duration += (sortedPoints[i + 1].timestamp.getTime() - sortedPoints[i].timestamp.getTime()) / 60000;
      } else {
        break;
      }
    }
    
    return Math.round(duration);
  }

  private countRecentOccurrences(metric: string, facilityId: string): number {
    const history = this.anomalyHistory.get(facilityId) || [];
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    return history.filter(a => 
      a.metric === metric && 
      a.timestamp.getTime() > dayAgo
    ).length;
  }

  private updateAnomalyHistory(facilityId: string, anomalies: Anomaly[]): void {
    const existing = this.anomalyHistory.get(facilityId) || [];
    this.anomalyHistory.set(facilityId, [...existing, ...anomalies]);
    
    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = (this.anomalyHistory.get(facilityId) || [])
      .filter(a => a.timestamp.getTime() > thirtyDaysAgo);
    this.anomalyHistory.set(facilityId, filtered);
  }

  private async gatherAnomalyContext(anomaly: Anomaly, facilityData: any): Promise<any> {
    return {
      facility: facilityData,
      environmental: this.getEnvironmentalContext(anomaly, facilityData),
      recentEvents: this.getRecentEvents(anomaly, facilityData),
      recentData: facilityData.sensorReadings.slice(0, 100)
    };
  }

  private getEnvironmentalContext(anomaly: Anomaly, facilityData: any): any {
    // Get environmental conditions at time of anomaly
    const timeWindow = 30 * 60 * 1000; // 30 minutes
    const relevantReadings = facilityData.sensorReadings.filter((r: any) => 
      Math.abs(r.timestamp.getTime() - anomaly.timestamp.getTime()) < timeWindow
    );
    
    const context: any = {};
    ['temperature', 'humidity', 'co2', 'light'].forEach(metric => {
      const readings = relevantReadings.filter((r: any) => r.type === metric);
      if (readings.length > 0) {
        context[metric] = {
          avg: readings.reduce((a: number, b: any) => a + b.value, 0) / readings.length,
          min: Math.min(...readings.map((r: any) => r.value)),
          max: Math.max(...readings.map((r: any) => r.value))
        };
      }
    });
    
    return context;
  }

  private getRecentEvents(anomaly: Anomaly, facilityData: any): any[] {
    // Simulate recent events - in production would query event log
    return [
      {
        timestamp: new Date(anomaly.timestamp.getTime() - 2 * 60 * 60 * 1000),
        description: 'Irrigation cycle completed'
      },
      {
        timestamp: new Date(anomaly.timestamp.getTime() - 30 * 60 * 1000),
        description: 'HVAC maintenance mode activated'
      }
    ];
  }

  private parseClaudeExplanation(response: string, anomaly: Anomaly): any {
    // Parse Claude's response into structured format
    // In production, this would use sophisticated NLP
    return {
      summary: `${anomaly.metric} anomaly detected with ${anomaly.deviation.sigmas.toFixed(1)} sigma deviation`,
      detailed: response,
      causes: [
        {
          id: 'cause_1',
          description: 'Equipment malfunction in environmental control system',
          probability: 0.7,
          category: 'equipment',
          evidenceSupport: ['Deviation pattern', 'Recent maintenance'],
          testingRequired: true,
          testingSuggestions: ['Check sensor calibration', 'Inspect control relays']
        }
      ],
      confidence: 0.85
    };
  }

  private generateFallbackExplanation(anomaly: Anomaly): any {
    return {
      summary: `Anomalous ${anomaly.metric} reading detected`,
      detailed: 'Automated analysis in progress',
      causes: [{
        id: 'unknown',
        description: 'Cause under investigation',
        probability: 1.0,
        category: 'systematic',
        evidenceSupport: [],
        testingRequired: true
      }],
      confidence: 0.5
    };
  }

  private calculateCorrelation(anomaly: Anomaly, readings: any[]): number {
    // Simplified correlation calculation
    // In production, would use proper statistical correlation
    const anomalyTime = anomaly.timestamp.getTime();
    const relevantReadings = readings.filter(r => 
      Math.abs(r.timestamp.getTime() - anomalyTime) < 30 * 60 * 1000
    );
    
    if (relevantReadings.length === 0) return 0;
    
    // Check if readings spike at similar time
    const spikes = relevantReadings.filter(r => 
      Math.abs(r.value - relevantReadings[0].value) > relevantReadings[0].value * 0.1
    );
    
    return spikes.length / relevantReadings.length;
  }

  private calculateTimeOffset(anomaly: Anomaly, readings: any[]): number {
    const anomalyTime = anomaly.timestamp.getTime();
    const firstSpike = readings.find(r => 
      Math.abs(r.value - readings[0].value) > readings[0].value * 0.1
    );
    
    if (!firstSpike) return 0;
    
    return (firstSpike.timestamp.getTime() - anomalyTime) / 60000; // minutes
  }

  private describeCorrelation(metric: string, correlation: number, anomaly: Anomaly): string {
    const direction = correlation > 0 ? 'increases' : 'decreases';
    return `${metric} ${direction} when ${anomaly.metric} anomaly occurs`;
  }

  private assessCropImpact(anomaly: Anomaly, cropData: any): any {
    // Assess impact based on crop sensitivity
    let severity: 'none' | 'minimal' | 'moderate' | 'severe' = 'none';
    const effects: string[] = [];
    
    if (anomaly.metric.includes('temperature')) {
      if (anomaly.severity === 'critical') {
        severity = 'severe';
        effects.push('Heat/cold stress', 'Reduced photosynthesis', 'Potential tissue damage');
      } else if (anomaly.severity === 'high') {
        severity = 'moderate';
        effects.push('Slowed growth', 'Stress response activation');
      }
    }
    
    return {
      affected: severity !== 'none',
      severity,
      specificEffects: effects,
      recoveryTime: severity === 'severe' ? '7-14 days' : severity === 'moderate' ? '3-7 days' : '1-2 days'
    };
  }

  private assessOperationalImpact(anomaly: Anomaly, facilityData: any): any {
    return {
      downtime: anomaly.severity === 'critical' ? 120 : anomaly.severity === 'high' ? 60 : 0,
      efficiency: anomaly.severity === 'critical' ? 50 : anomaly.severity === 'high' ? 75 : 90,
      cascadeRisk: anomaly.type === AnomalyType.EQUIPMENT,
      affectedSystems: this.getAffectedSystems(anomaly)
    };
  }

  private assessFinancialImpact(anomaly: Anomaly, cropImpact: any, operationalImpact: any): any {
    const baseCost = anomaly.severity === 'critical' ? 1000 : anomaly.severity === 'high' ? 500 : 100;
    const revenueLoss = cropImpact.severity === 'severe' ? 5000 : cropImpact.severity === 'moderate' ? 2000 : 0;
    
    return {
      estimatedCost: baseCost + operationalImpact.downtime * 10,
      revenueRisk: revenueLoss,
      confidenceRange: {
        min: (baseCost + revenueLoss) * 0.7,
        max: (baseCost + revenueLoss) * 1.5
      }
    };
  }

  private assessComplianceImpact(anomaly: Anomaly): any {
    const regulatoryMetrics = ['temperature', 'humidity', 'water_quality'];
    
    return {
      regulatoryRisk: regulatoryMetrics.some(m => anomaly.metric.includes(m)) && anomaly.severity !== 'low',
      affectedStandards: anomaly.metric.includes('temperature') ? ['GMP', 'GACP'] : [],
      reportingRequired: anomaly.severity === 'critical'
    };
  }

  private getAffectedSystems(anomaly: Anomaly): string[] {
    const systemMap: Record<AnomalyType, string[]> = {
      [AnomalyType.ENVIRONMENTAL]: ['HVAC', 'Ventilation', 'Climate Control'],
      [AnomalyType.EQUIPMENT]: ['Control Systems', 'Monitoring', 'Automation'],
      [AnomalyType.WATER]: ['Irrigation', 'Nutrient Delivery', 'pH Control'],
      [AnomalyType.NUTRIENT]: ['Fertigation', 'Dosing Systems'],
      [AnomalyType.ENERGY]: ['Power Distribution', 'Lighting', 'HVAC'],
      [AnomalyType.CROP_HEALTH]: ['Environmental Control', 'Irrigation'],
      [AnomalyType.OPERATIONAL]: ['Various Systems'],
      [AnomalyType.SECURITY]: ['Access Control', 'Monitoring']
    };
    
    return systemMap[anomaly.type] || ['Unknown'];
  }

  private generateEmergencySteps(anomaly: Anomaly): string[] {
    const steps: string[] = [];
    
    if (anomaly.metric.includes('temperature')) {
      steps.push(
        'Check HVAC system status immediately',
        'Verify all vents and dampers are operational',
        'Activate backup cooling/heating if available',
        'Monitor crop stress indicators'
      );
    } else if (anomaly.metric.includes('humidity')) {
      steps.push(
        'Check dehumidification equipment',
        'Increase ventilation if possible',
        'Inspect for water leaks',
        'Monitor for fungal growth risk'
      );
    }
    
    steps.push('Document all observations', 'Contact facility manager if unresolved');
    
    return steps;
  }

  private generateDiagnosticSteps(anomaly: Anomaly, causes: any[]): string[] {
    const steps: string[] = ['Review sensor calibration records'];
    
    causes.forEach(cause => {
      if (cause.testingSuggestions) {
        steps.push(...cause.testingSuggestions);
      }
    });
    
    steps.push(
      'Check related equipment logs',
      'Interview staff about recent changes',
      'Review maintenance history'
    );
    
    return steps;
  }

  private generatePreventiveSteps(anomaly: Anomaly): string[] {
    return [
      'Schedule comprehensive system inspection',
      'Update preventive maintenance schedule',
      'Install redundant sensors if critical',
      'Create automated alert thresholds',
      'Train staff on early detection',
      'Document standard operating procedures'
    ];
  }

  private getHistoricalContext(anomaly: Anomaly, facilityId: string): HistoricalContext {
    const history = this.anomalyHistory.get(facilityId) || [];
    const similarAnomalies = history.filter(a => 
      a.metric === anomaly.metric && 
      a.type === anomaly.type
    );
    
    const lastOccurrence = similarAnomalies
      .filter(a => a.timestamp < anomaly.timestamp)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    return {
      previousOccurrences: similarAnomalies.length,
      lastOccurrence: lastOccurrence?.timestamp,
      trend: this.calculateTrend(similarAnomalies),
      seasonalPattern: this.detectSeasonalPattern(similarAnomalies),
      relatedIncidents: [],
      resolutionHistory: {
        successfulActions: ['Sensor recalibration', 'Equipment replacement'],
        averageResolutionTime: 120
      }
    };
  }

  private calculateTrend(anomalies: Anomaly[]): 'increasing' | 'stable' | 'decreasing' | 'new' {
    if (anomalies.length < 2) return 'new';
    
    // Calculate frequency over time
    const sorted = anomalies.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const recentCount = sorted.filter(a => 
      a.timestamp.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const oldCount = sorted.filter(a => 
      a.timestamp.getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000 &&
      a.timestamp.getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    
    if (recentCount > oldCount * 1.5) return 'increasing';
    if (recentCount < oldCount * 0.5) return 'decreasing';
    return 'stable';
  }

  private detectSeasonalPattern(anomalies: Anomaly[]): boolean {
    // Simple seasonal detection - in production would be more sophisticated
    if (anomalies.length < 10) return false;
    
    const monthCounts = new Map<number, number>();
    anomalies.forEach(a => {
      const month = a.timestamp.getMonth();
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    });
    
    // Check if certain months have significantly more anomalies
    const avgCount = anomalies.length / 12;
    const highMonths = Array.from(monthCounts.values()).filter(c => c > avgCount * 2);
    
    return highMonths.length > 0;
  }

  private async getScientificBacking(anomaly: Anomaly, cropType: string): Promise<any> {
    try {
      const papers = await researchVerificationSystem.findSupportingEvidence(
        `${anomaly.metric} stress ${cropType} cultivation`,
        cropType
      );
      
      return {
        sources: papers.slice(0, 3).map((p: any) => p.title),
        relevantStudies: papers.slice(0, 3).map((p: any) => 
          `${p.authors[0]} et al. (${new Date(p.publishedDate).getFullYear()})`
        )
      };
    } catch (error) {
      console.error('Error getting scientific backing:', error);
      return undefined;
    }
  }
}

// Export singleton instance
export const anomalyExplanationSystem = new AnomalyExplanationSystem();