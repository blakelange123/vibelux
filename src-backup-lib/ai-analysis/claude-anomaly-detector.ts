/**
 * Claude-powered Anomaly Detection and Analysis System
 * Combines statistical analysis with AI reasoning for intelligent insights
 */

export interface AnomalyData {
  timestamp: Date;
  parameter: string;
  value: number;
  expectedRange: { min: number; max: number; optimal: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  context: {
    growthStage: string;
    timeOfDay: number;
    environmentalConditions: Record<string, number>;
    recentTrends: Array<{ timestamp: Date; value: number }>;
  };
}

export interface ClaudeAnalysis {
  summary: string;
  rootCause: string;
  immediateActions: string[];
  longTermRecommendations: string[];
  riskAssessment: {
    plantHealth: number; // 0-1 risk score
    yieldImpact: number;
    timeToAction: string; // "immediate", "within_hours", "within_days"
  };
  scientificRationale: string;
}

export class ClaudeAnomalyDetector {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/ai-assistant/command') {
    this.apiEndpoint = apiEndpoint;
  }

  public async analyzeAnomaly(anomaly: AnomalyData): Promise<ClaudeAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(anomaly);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'anomaly_analysis',
          maxTokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseClaudeResponse(data.response);
      
    } catch (error) {
      console.error('Error analyzing anomaly with Claude:', error);
      return this.getFallbackAnalysis(anomaly);
    }
  }

  public async analyzeBatchAnomalies(anomalies: AnomalyData[]): Promise<{
    overallSummary: string;
    prioritizedActions: string[];
    systemHealthScore: number;
    criticalIssues: ClaudeAnalysis[];
  }> {
    try {
      const prompt = this.buildBatchAnalysisPrompt(anomalies);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'batch_anomaly_analysis',
          maxTokens: 800
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBatchResponse(data.response, anomalies);
      
    } catch (error) {
      console.error('Error analyzing batch anomalies with Claude:', error);
      return this.getFallbackBatchAnalysis(anomalies);
    }
  }

  public async generateOptimizationInsights(
    currentMetrics: Record<string, number>,
    historicalData: Array<{ timestamp: Date; metrics: Record<string, number> }>,
    growthStage: string
  ): Promise<{
    insights: string[];
    optimizationOpportunities: string[];
    predictedOutcomes: string[];
    actionPlan: string[];
  }> {
    try {
      const prompt = this.buildOptimizationPrompt(currentMetrics, historicalData, growthStage);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'optimization_insights',
          maxTokens: 600
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseOptimizationResponse(data.response);
      
    } catch (error) {
      console.error('Error generating optimization insights with Claude:', error);
      return this.getFallbackOptimizationInsights();
    }
  }

  private buildAnalysisPrompt(anomaly: AnomalyData): string {
    const recentValues = anomaly.context.recentTrends
      .map(t => `${t.timestamp.toISOString().slice(11, 16)}: ${t.value}`)
      .join(', ');

    return `As a cultivation AI expert, analyze this anomaly detection:

ANOMALY DETAILS:
- Parameter: ${anomaly.parameter}
- Current Value: ${anomaly.value}
- Expected Range: ${anomaly.expectedRange.min} - ${anomaly.expectedRange.max} (optimal: ${anomaly.expectedRange.optimal})
- Severity: ${anomaly.severity}
- Confidence: ${(anomaly.confidence * 100).toFixed(0)}%

PLANT CONTEXT:
- Growth Stage: ${anomaly.context.growthStage}
- Time of Day: ${anomaly.context.timeOfDay}:00
- Environmental Conditions: ${JSON.stringify(anomaly.context.environmentalConditions)}
- Recent Trend: ${recentValues}

Please provide:
1. SUMMARY: Brief explanation of what's happening
2. ROOT_CAUSE: Most likely cause of this anomaly
3. IMMEDIATE_ACTIONS: 2-3 urgent actions needed
4. LONG_TERM: 2-3 preventive measures
5. RISK_ASSESSMENT: Plant health risk (0-100), yield impact (0-100), urgency (immediate/hours/days)
6. SCIENCE: Scientific rationale in 1-2 sentences

Format your response as structured sections.`;
  }

  private buildBatchAnalysisPrompt(anomalies: AnomalyData[]): string {
    const anomalyList = anomalies.map((a, i) => 
      `${i + 1}. ${a.parameter}: ${a.value} (${a.severity} severity, ${a.context.growthStage} stage)`
    ).join('\n');

    return `As a cultivation AI expert, analyze these multiple anomalies detected simultaneously:

DETECTED ANOMALIES:
${anomalyList}

SYSTEM CONTEXT:
- Total anomalies: ${anomalies.length}
- Critical issues: ${anomalies.filter(a => a.severity === 'critical').length}
- Growth stages affected: ${[...new Set(anomalies.map(a => a.context.growthStage))].join(', ')}

Please provide:
1. OVERALL_SUMMARY: What's happening across the system
2. PRIORITIZED_ACTIONS: Top 5 actions in order of urgency
3. SYSTEM_HEALTH: Overall system health score (0-100)
4. CRITICAL_FOCUS: Which anomalies need immediate attention and why

Focus on systemic issues and cascading effects between parameters.`;
  }

  private buildOptimizationPrompt(
    currentMetrics: Record<string, number>,
    historicalData: Array<{ timestamp: Date; metrics: Record<string, number> }>,
    growthStage: string
  ): string {
    const metricsString = Object.entries(currentMetrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const trendAnalysis = this.calculateTrends(historicalData);

    return `As a cultivation AI expert, analyze this facility's performance and provide optimization insights:

CURRENT METRICS:
${metricsString}

GROWTH STAGE: ${growthStage}

RECENT TRENDS (last 7 days):
${trendAnalysis}

DATA POINTS: ${historicalData.length} measurements over ${this.getTimespan(historicalData)}

Please provide:
1. INSIGHTS: 3-4 key observations about current performance
2. OPTIMIZATION_OPPORTUNITIES: 3-4 specific improvements possible
3. PREDICTED_OUTCOMES: What to expect if recommendations are followed
4. ACTION_PLAN: Step-by-step optimization approach

Focus on data-driven recommendations with expected impact on yield and quality.`;
  }

  private calculateTrends(historicalData: Array<{ timestamp: Date; metrics: Record<string, number> }>): string {
    if (historicalData.length < 2) return 'Insufficient data for trend analysis';

    const recent = historicalData.slice(-7); // Last 7 data points
    const older = historicalData.slice(-14, -7); // Previous 7 data points

    if (older.length === 0) return 'Limited historical data available';

    const trends: string[] = [];
    const metrics = Object.keys(recent[0]?.metrics || {});

    metrics.forEach(metric => {
      const recentAvg = recent.reduce((sum, d) => sum + (d.metrics[metric] || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, d) => sum + (d.metrics[metric] || 0), 0) / older.length;
      
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;
      const direction = change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable';
      
      trends.push(`${metric}: ${direction} (${change.toFixed(1)}%)`);
    });

    return trends.join(', ');
  }

  private getTimespan(historicalData: Array<{ timestamp: Date; metrics: Record<string, number> }>): string {
    if (historicalData.length < 2) return 'single measurement';
    
    const start = historicalData[0].timestamp;
    const end = historicalData[historicalData.length - 1].timestamp;
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${days} days`;
  }

  private parseClaudeResponse(response: string): ClaudeAnalysis {
    try {
      // Parse Claude's structured response
      const sections = this.extractSections(response);
      
      return {
        summary: sections.SUMMARY || sections.summary || 'Analysis unavailable',
        rootCause: sections.ROOT_CAUSE || sections.root_cause || 'Cause unclear',
        immediateActions: this.parseListSection(sections.IMMEDIATE_ACTIONS || sections.immediate_actions || ''),
        longTermRecommendations: this.parseListSection(sections.LONG_TERM || sections.long_term || ''),
        riskAssessment: this.parseRiskAssessment(sections.RISK_ASSESSMENT || sections.risk_assessment || ''),
        scientificRationale: sections.SCIENCE || sections.scientific || 'Scientific rationale not provided'
      };
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return this.getBasicAnalysis(response);
    }
  }

  private parseBatchResponse(response: string, anomalies: AnomalyData[]): {
    overallSummary: string;
    prioritizedActions: string[];
    systemHealthScore: number;
    criticalIssues: ClaudeAnalysis[];
  } {
    try {
      const sections = this.extractSections(response);
      
      const healthMatch = (sections.SYSTEM_HEALTH || sections.system_health || '50').match(/\d+/);
      const healthScore = healthMatch ? parseInt(healthMatch[0]) / 100 : 0.5;

      return {
        overallSummary: sections.OVERALL_SUMMARY || sections.overall_summary || 'System analysis unavailable',
        prioritizedActions: this.parseListSection(sections.PRIORITIZED_ACTIONS || sections.prioritized_actions || ''),
        systemHealthScore: healthScore,
        criticalIssues: [] // Would need additional analysis for critical issues
      };
    } catch (error) {
      console.error('Error parsing batch response:', error);
      return this.getFallbackBatchAnalysis(anomalies);
    }
  }

  private parseOptimizationResponse(response: string): {
    insights: string[];
    optimizationOpportunities: string[];
    predictedOutcomes: string[];
    actionPlan: string[];
  } {
    try {
      const sections = this.extractSections(response);
      
      return {
        insights: this.parseListSection(sections.INSIGHTS || sections.insights || ''),
        optimizationOpportunities: this.parseListSection(sections.OPTIMIZATION_OPPORTUNITIES || sections.optimization_opportunities || ''),
        predictedOutcomes: this.parseListSection(sections.PREDICTED_OUTCOMES || sections.predicted_outcomes || ''),
        actionPlan: this.parseListSection(sections.ACTION_PLAN || sections.action_plan || '')
      };
    } catch (error) {
      console.error('Error parsing optimization response:', error);
      return this.getFallbackOptimizationInsights();
    }
  }

  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent = '';

    for (const line of lines) {
      const sectionMatch = line.match(/^\d*\.?\s*(SUMMARY|ROOT_CAUSE|IMMEDIATE_ACTIONS|LONG_TERM|RISK_ASSESSMENT|SCIENCE|OVERALL_SUMMARY|PRIORITIZED_ACTIONS|SYSTEM_HEALTH|INSIGHTS|OPTIMIZATION_OPPORTUNITIES|PREDICTED_OUTCOMES|ACTION_PLAN)[:.]?\s*(.*)/i);
      
      if (sectionMatch) {
        if (currentSection) {
          sections[currentSection] = currentContent.trim();
        }
        currentSection = sectionMatch[1].toUpperCase();
        currentContent = sectionMatch[2] || '';
      } else if (currentSection) {
        currentContent += ' ' + line;
      }
    }
    
    if (currentSection) {
      sections[currentSection] = currentContent.trim();
    }

    return sections;
  }

  private parseListSection(text: string): string[] {
    if (!text) return [];
    
    return text
      .split(/[\n\r]/)
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5); // Limit to 5 items
  }

  private parseRiskAssessment(text: string): ClaudeAnalysis['riskAssessment'] {
    const plantHealthMatch = text.match(/plant\s+health[:\s]+(\d+)/i);
    const yieldImpactMatch = text.match(/yield\s+impact[:\s]+(\d+)/i);
    const urgencyMatch = text.match(/urgency[:\s]+(immediate|hours|days)/i);

    return {
      plantHealth: plantHealthMatch ? parseInt(plantHealthMatch[1]) / 100 : 0.5,
      yieldImpact: yieldImpactMatch ? parseInt(yieldImpactMatch[1]) / 100 : 0.3,
      timeToAction: urgencyMatch ? urgencyMatch[1] : 'within_hours'
    };
  }

  private getFallbackAnalysis(anomaly: AnomalyData): ClaudeAnalysis {
    return {
      summary: `${anomaly.parameter} reading of ${anomaly.value} is outside expected range`,
      rootCause: 'Requires further investigation to determine root cause',
      immediateActions: ['Monitor parameter closely', 'Check equipment calibration'],
      longTermRecommendations: ['Review standard operating procedures', 'Consider system upgrades'],
      riskAssessment: {
        plantHealth: anomaly.severity === 'critical' ? 0.8 : 0.4,
        yieldImpact: 0.3,
        timeToAction: anomaly.severity === 'critical' ? 'immediate' : 'within_hours'
      },
      scientificRationale: 'Parameter deviation may affect plant physiology and optimal growth conditions.'
    };
  }

  private getFallbackBatchAnalysis(anomalies: AnomalyData[]): {
    overallSummary: string;
    prioritizedActions: string[];
    systemHealthScore: number;
    criticalIssues: ClaudeAnalysis[];
  } {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const healthScore = Math.max(0.1, 1 - (criticalCount / anomalies.length));

    return {
      overallSummary: `${anomalies.length} anomalies detected with ${criticalCount} critical issues requiring attention`,
      prioritizedActions: [
        'Address critical severity anomalies first',
        'Check system calibration',
        'Review environmental controls',
        'Monitor plant response',
        'Update maintenance schedule'
      ],
      systemHealthScore: healthScore,
      criticalIssues: []
    };
  }

  private getFallbackOptimizationInsights(): {
    insights: string[];
    optimizationOpportunities: string[];
    predictedOutcomes: string[];
    actionPlan: string[];
  } {
    return {
      insights: [
        'System is operating within normal parameters',
        'Historical data shows stable performance trends',
        'Growth stage progression appears on schedule'
      ],
      optimizationOpportunities: [
        'Fine-tune environmental parameters for current growth stage',
        'Optimize lighting schedule for energy efficiency',
        'Review nutrient delivery timing'
      ],
      predictedOutcomes: [
        'Continued stable growth with current settings',
        'Potential 5-10% efficiency improvements with optimization',
        'Enhanced plant quality with targeted adjustments'
      ],
      actionPlan: [
        'Collect additional performance data',
        'Implement gradual parameter adjustments',
        'Monitor plant response to changes',
        'Document results for future optimization'
      ]
    };
  }

  private getBasicAnalysis(response: string): ClaudeAnalysis {
    return {
      summary: response.substring(0, 200) + '...',
      rootCause: 'Analysis provided by AI assistant',
      immediateActions: ['Review AI recommendations', 'Consult with experts'],
      longTermRecommendations: ['Implement suggested changes', 'Monitor results'],
      riskAssessment: {
        plantHealth: 0.5,
        yieldImpact: 0.3,
        timeToAction: 'within_hours'
      },
      scientificRationale: 'Based on AI analysis of current conditions and best practices.'
    };
  }
}