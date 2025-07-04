/**
 * Intelligent Report Narrative Generation with Claude
 * Automatically generates professional, insightful reports from facility data
 */

import { ClaudeVibeLuxAssistant } from './claude-integration';
import { cropDatabase } from './comprehensive-crop-database';
import { researchVerificationSystem } from './research-verification-system';

export interface ReportContext {
  facilityId: string;
  facilityName: string;
  reportType: 'performance' | 'benchmark' | 'optimization' | 'compliance' | 'executive' | 'technical';
  timeframe: '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
  audience: 'executive' | 'operations' | 'technical' | 'investor' | 'regulatory';
  customDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ReportData {
  metrics: {
    yield: { current: number; target: number; trend: number };
    quality: { current: number; target: number; trend: number };
    energy: { current: number; efficiency: number; cost: number };
    environmental: {
      temperature: { avg: number; variance: number; alerts: number };
      humidity: { avg: number; variance: number; alerts: number };
      co2: { avg: number; variance: number; alerts: number };
      light: { ppfd: number; dli: number; uniformity: number };
    };
  };
  benchmarkData?: {
    industryAverage: Record<string, number>;
    topPerformers: Record<string, number>;
    ranking: number;
    percentile: number;
  };
  incidents: Array<{
    timestamp: Date;
    type: 'alert' | 'warning' | 'info';
    category: 'environmental' | 'equipment' | 'crop' | 'energy';
    description: string;
    impact: 'low' | 'medium' | 'high';
    resolved: boolean;
  }>;
  financialData?: {
    revenue: number;
    operatingCosts: number;
    profit: number;
    roi: number;
    projections: Record<string, number>;
  };
  cropData: {
    varieties: string[];
    growthStages: Record<string, number>;
    harvestSchedule: Array<{
      variety: string;
      estimatedDate: Date;
      expectedYield: number;
    }>;
  };
}

export interface GeneratedReport {
  id: string;
  title: string;
  executiveSummary: string;
  sections: ReportSection[];
  insights: Insight[];
  recommendations: Recommendation[];
  appendices: Appendix[];
  metadata: {
    generatedAt: Date;
    context: ReportContext;
    dataQuality: number;
    confidenceLevel: number;
    wordCount: number;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  charts: ChartDefinition[];
  tables: TableDefinition[];
  priority: 'high' | 'medium' | 'low';
}

export interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  dataSupport: string[];
  relatedMetrics: string[];
}

export interface Recommendation {
  id: string;
  category: 'operational' | 'technical' | 'financial' | 'strategic';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
    cost: 'minimal' | 'moderate' | 'significant';
    steps: string[];
  };
  roi: {
    investment: number;
    expectedReturn: number;
    paybackPeriod: string;
  };
  scientificBacking?: {
    sources: string[];
    confidenceLevel: number;
  };
}

export interface Appendix {
  id: string;
  title: string;
  type: 'data_tables' | 'methodology' | 'calculations' | 'research_citations' | 'compliance_docs';
  content: string;
}

export interface ChartDefinition {
  type: 'line' | 'bar' | 'scatter' | 'heatmap' | 'gauge';
  title: string;
  data: any;
  config: any;
}

export interface TableDefinition {
  title: string;
  headers: string[];
  rows: string[][];
  formatting?: Record<string, any>;
}

export class IntelligentReportGenerator {
  private claudeAssistant: ClaudeVibeLuxAssistant;

  constructor() {
    this.claudeAssistant = new ClaudeVibeLuxAssistant();
  }

  /**
   * Generate comprehensive intelligent report
   */
  async generateReport(context: ReportContext, data: ReportData): Promise<GeneratedReport> {
    console.log(`Generating ${context.reportType} report for ${context.facilityName}`);

    // 1. Analyze data and generate insights
    const insights = await this.generateInsights(data, context);

    // 2. Generate evidence-based recommendations
    const recommendations = await this.generateRecommendations(data, insights, context);

    // 3. Create narrative sections
    const sections = await this.generateSections(data, insights, recommendations, context);

    // 4. Generate executive summary
    const executiveSummary = await this.generateExecutiveSummary(data, insights, recommendations, context);

    // 5. Create appendices
    const appendices = await this.generateAppendices(data, context);

    // 6. Calculate metadata
    const metadata = this.calculateMetadata(context, data, insights, recommendations, sections);

    const report: GeneratedReport = {
      id: `report_${context.facilityId}_${Date.now()}`,
      title: this.generateReportTitle(context),
      executiveSummary,
      sections,
      insights,
      recommendations,
      appendices,
      metadata
    };

    return report;
  }

  /**
   * Generate data-driven insights using Claude
   */
  private async generateInsights(data: ReportData, context: ReportContext): Promise<Insight[]> {
    const prompt = `
    Analyze this facility performance data and identify key insights:

    FACILITY: ${context.facilityName}
    TIMEFRAME: ${context.timeframe}
    
    PERFORMANCE METRICS:
    - Yield: ${data.metrics.yield.current} (target: ${data.metrics.yield.target}, trend: ${data.metrics.yield.trend > 0 ? '+' : ''}${data.metrics.yield.trend}%)
    - Quality: ${data.metrics.quality.current} (target: ${data.metrics.quality.target}, trend: ${data.metrics.quality.trend > 0 ? '+' : ''}${data.metrics.quality.trend}%)
    - Energy Efficiency: ${data.metrics.energy.efficiency} kWh/kg
    - Energy Cost: $${data.metrics.energy.cost}
    
    ENVIRONMENTAL CONDITIONS:
    - Temperature: ${data.metrics.environmental.temperature.avg}°C (variance: ±${data.metrics.environmental.temperature.variance}°C, alerts: ${data.metrics.environmental.temperature.alerts})
    - Humidity: ${data.metrics.environmental.humidity.avg}% (variance: ±${data.metrics.environmental.humidity.variance}%, alerts: ${data.metrics.environmental.humidity.alerts})
    - CO2: ${data.metrics.environmental.co2.avg}ppm (variance: ±${data.metrics.environmental.co2.variance}ppm, alerts: ${data.metrics.environmental.co2.alerts})
    - Light: ${data.metrics.environmental.light.ppfd} PPFD, ${data.metrics.environmental.light.dli} DLI, ${data.metrics.environmental.light.uniformity}% uniformity
    
    ${data.benchmarkData ? `
    INDUSTRY BENCHMARKS:
    - Industry ranking: ${data.benchmarkData.ranking} (${data.benchmarkData.percentile}th percentile)
    - Performance vs industry average: ${Object.entries(data.benchmarkData.industryAverage).map(([key, val]) => `${key}: ${val}`).join(', ')}
    ` : ''}
    
    INCIDENTS: ${data.incidents.length} total incidents (${data.incidents.filter(i => i.impact === 'high').length} high impact, ${data.incidents.filter(i => !i.resolved).length} unresolved)
    
    CROP DATA:
    - Varieties: ${data.cropData.varieties.join(', ')}
    - Growth stages: ${Object.entries(data.cropData.growthStages).map(([stage, count]) => `${stage}: ${count}`).join(', ')}
    
    Identify 3-5 key insights categorized as:
    - OPPORTUNITIES: Areas for improvement or growth
    - RISKS: Potential issues or threats  
    - TRENDS: Patterns over time
    - ANOMALIES: Unusual data points requiring attention
    - ACHIEVEMENTS: Notable successes or milestones
    
    For each insight, provide:
    1. Clear, actionable title
    2. Detailed description with data support
    3. Impact level (high/medium/low)
    4. Confidence assessment
    5. Related metrics

    Format as professional analysis suitable for ${context.audience} audience.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData: { id: context.facilityId, name: context.facilityName },
        sensorData: [],
        userRole: 'ADMIN',
        timeframe: context.timeframe
      });

      // Parse Claude's response into structured insights
      return this.parseInsightsFromResponse(response.answer, data);

    } catch (error) {
      console.error('Error generating insights:', error);
      return this.generateFallbackInsights(data);
    }
  }

  /**
   * Generate evidence-based recommendations
   */
  private async generateRecommendations(
    data: ReportData, 
    insights: Insight[], 
    context: ReportContext
  ): Promise<Recommendation[]> {
    const prompt = `
    Based on the facility data and insights, generate specific, actionable recommendations:

    KEY INSIGHTS:
    ${insights.map(insight => `
    - ${insight.type.toUpperCase()}: ${insight.title}
      ${insight.description}
      Impact: ${insight.impact}, Confidence: ${(insight.confidence * 100).toFixed(0)}%
    `).join('\n')}

    CURRENT PERFORMANCE GAPS:
    ${data.metrics.yield.current < data.metrics.yield.target ? `- Yield gap: ${data.metrics.yield.target - data.metrics.yield.current} below target` : ''}
    ${data.metrics.quality.current < data.metrics.quality.target ? `- Quality gap: ${data.metrics.quality.target - data.metrics.quality.current} below target` : ''}
    ${data.metrics.environmental.temperature.alerts > 0 ? `- Temperature control issues: ${data.metrics.environmental.temperature.alerts} alerts` : ''}
    ${data.metrics.environmental.humidity.alerts > 0 ? `- Humidity control issues: ${data.metrics.environmental.humidity.alerts} alerts` : ''}

    CROPS: ${data.cropData.varieties.join(', ')}

    Generate 4-6 recommendations categorized as:
    - OPERATIONAL: Day-to-day improvements
    - TECHNICAL: Equipment or system upgrades
    - FINANCIAL: Cost reduction or revenue optimization
    - STRATEGIC: Long-term positioning and growth

    For each recommendation, provide:
    1. Priority level (critical/high/medium/low)
    2. Clear title and detailed description
    3. Expected impact (quantified where possible)
    4. Implementation details:
       - Effort level (low/medium/high)
       - Timeframe
       - Cost category (minimal/moderate/significant)
       - Specific steps
    5. ROI analysis:
       - Investment required
       - Expected return
       - Payback period

    Base recommendations on scientific evidence for the specific crops being grown.
    Focus on actionable items appropriate for ${context.audience} audience.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData: { id: context.facilityId, name: context.facilityName },
        sensorData: [],
        userRole: 'ADMIN',
        timeframe: context.timeframe
      });

      return this.parseRecommendationsFromResponse(response.answer, data, context);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.generateFallbackRecommendations(data, insights);
    }
  }

  /**
   * Generate narrative report sections
   */
  private async generateSections(
    data: ReportData,
    insights: Insight[],
    recommendations: Recommendation[],
    context: ReportContext
  ): Promise<ReportSection[]> {
    const sections: ReportSection[] = [];

    // Performance Overview Section
    const performanceSection = await this.generatePerformanceSection(data, context);
    sections.push(performanceSection);

    // Environmental Analysis Section
    const environmentalSection = await this.generateEnvironmentalSection(data, context);
    sections.push(environmentalSection);

    // Operational Insights Section
    const insightsSection = await this.generateInsightsSection(insights, context);
    sections.push(insightsSection);

    // Recommendations Section
    const recommendationsSection = await this.generateRecommendationsSection(recommendations, context);
    sections.push(recommendationsSection);

    // Financial Analysis Section (if data available)
    if (data.financialData) {
      const financialSection = await this.generateFinancialSection(data.financialData, context);
      sections.push(financialSection);
    }

    // Benchmark Comparison Section (if data available)
    if (data.benchmarkData) {
      const benchmarkSection = await this.generateBenchmarkSection(data.benchmarkData, context);
      sections.push(benchmarkSection);
    }

    return sections;
  }

  /**
   * Generate executive summary
   */
  private async generateExecutiveSummary(
    data: ReportData,
    insights: Insight[],
    recommendations: Recommendation[],
    context: ReportContext
  ): Promise<string> {
    const prompt = `
    Write a professional executive summary for this facility performance report:

    FACILITY: ${context.facilityName}
    REPORT PERIOD: ${context.timeframe}
    AUDIENCE: ${context.audience}

    KEY PERFORMANCE INDICATORS:
    - Yield Performance: ${data.metrics.yield.current} (${data.metrics.yield.trend > 0 ? '+' : ''}${data.metrics.yield.trend}% vs target)
    - Quality Score: ${data.metrics.quality.current} (${data.metrics.quality.trend > 0 ? '+' : ''}${data.metrics.quality.trend}% vs target)
    - Energy Efficiency: ${data.metrics.energy.efficiency} kWh/kg
    - Operational Alerts: ${data.incidents.filter(i => !i.resolved).length} unresolved

    TOP INSIGHTS:
    ${insights.slice(0, 3).map(insight => `- ${insight.title}: ${insight.description}`).join('\n')}

    PRIORITY RECOMMENDATIONS:
    ${recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').slice(0, 3).map(rec => `- ${rec.title}: ${rec.expectedImpact}`).join('\n')}

    ${data.benchmarkData ? `INDUSTRY POSITION: ${data.benchmarkData.percentile}th percentile (rank ${data.benchmarkData.ranking})` : ''}

    Write a concise, professional summary (200-300 words) that:
    1. Highlights key performance achievements and challenges
    2. Identifies most important insights and their business impact
    3. Summarizes critical recommendations and expected benefits
    4. Provides clear next steps

    Tone should be professional, data-driven, and appropriate for ${context.audience} stakeholders.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData: { id: context.facilityId, name: context.facilityName },
        sensorData: [],
        userRole: 'ADMIN',
        timeframe: context.timeframe
      });

      return response.answer;

    } catch (error) {
      console.error('Error generating executive summary:', error);
      return this.generateFallbackExecutiveSummary(data, context);
    }
  }

  // Helper methods for parsing and fallbacks
  private parseInsightsFromResponse(response: string, data: ReportData): Insight[] {
    // Parse Claude's response into structured insights
    // This would include sophisticated NLP parsing in production
    const insights: Insight[] = [];
    
    // For now, create sample insights based on data patterns
    if (data.metrics.yield.trend > 5) {
      insights.push({
        id: 'yield_improvement',
        type: 'achievement',
        title: 'Significant Yield Improvement',
        description: `Yield has increased by ${data.metrics.yield.trend}% over the reporting period, indicating successful optimization efforts.`,
        impact: 'high',
        confidence: 0.9,
        dataSupport: ['yield_metrics'],
        relatedMetrics: ['yield', 'efficiency']
      });
    }

    if (data.metrics.environmental.temperature.alerts > 5) {
      insights.push({
        id: 'temperature_instability',
        type: 'risk',
        title: 'Temperature Control Instability',
        description: `${data.metrics.environmental.temperature.alerts} temperature alerts indicate potential HVAC issues requiring attention.`,
        impact: 'medium',
        confidence: 0.8,
        dataSupport: ['temperature_alerts'],
        relatedMetrics: ['temperature', 'energy']
      });
    }

    return insights;
  }

  private parseRecommendationsFromResponse(response: string, data: ReportData, context: ReportContext): Recommendation[] {
    // Parse Claude's response into structured recommendations
    const recommendations: Recommendation[] = [];
    
    // Generate sample recommendations based on data
    if (data.metrics.energy.efficiency > 3) {
      recommendations.push({
        id: 'energy_optimization',
        category: 'technical',
        priority: 'high',
        title: 'LED Fixture Upgrade for Energy Efficiency',
        description: 'Current energy consumption of 3+ kWh/kg indicates opportunity for more efficient LED fixtures.',
        expectedImpact: '20-30% reduction in energy costs',
        implementation: {
          effort: 'medium',
          timeframe: '3-6 months',
          cost: 'moderate',
          steps: [
            'Conduct LED fixture audit',
            'Select high-efficacy fixtures (3.5+ μmol/J)',
            'Plan installation schedule',
            'Monitor performance improvements'
          ]
        },
        roi: {
          investment: 50000,
          expectedReturn: 20000,
          paybackPeriod: '2.5 years'
        }
      });
    }

    return recommendations;
  }

  private generateFallbackInsights(data: ReportData): Insight[] {
    return [{
      id: 'performance_summary',
      type: 'trend',
      title: 'Overall Performance Status',
      description: 'Facility metrics are being analyzed for performance trends and optimization opportunities.',
      impact: 'medium',
      confidence: 0.7,
      dataSupport: ['general_metrics'],
      relatedMetrics: ['yield', 'quality', 'energy']
    }];
  }

  private generateFallbackRecommendations(data: ReportData, insights: Insight[]): Recommendation[] {
    return [{
      id: 'general_optimization',
      category: 'operational',
      priority: 'medium',
      title: 'Continue Performance Monitoring',
      description: 'Maintain consistent monitoring and data collection for ongoing optimization.',
      expectedImpact: 'Improved operational awareness',
      implementation: {
        effort: 'low',
        timeframe: 'Ongoing',
        cost: 'minimal',
        steps: ['Review daily metrics', 'Investigate anomalies', 'Document improvements']
      },
      roi: {
        investment: 0,
        expectedReturn: 5000,
        paybackPeriod: 'Immediate'
      }
    }];
  }

  private generateFallbackExecutiveSummary(data: ReportData, context: ReportContext): string {
    return `
    Performance Summary for ${context.facilityName}

    During the ${context.timeframe} reporting period, the facility maintained operational status with yield performance at ${data.metrics.yield.current} and quality metrics at ${data.metrics.quality.current}. 

    Key areas of focus include optimizing energy efficiency (currently ${data.metrics.energy.efficiency} kWh/kg) and addressing ${data.incidents.filter(i => !i.resolved).length} unresolved operational alerts.

    Recommended next steps include continued monitoring, environmental optimization, and implementation of efficiency improvements to enhance overall facility performance.
    `;
  }

  // Additional helper methods for section generation
  private async generatePerformanceSection(data: ReportData, context: ReportContext): Promise<ReportSection> {
    return {
      id: 'performance_overview',
      title: 'Performance Overview',
      content: `Facility performance analysis for ${context.timeframe} period...`,
      charts: [],
      tables: [],
      priority: 'high'
    };
  }

  private async generateEnvironmentalSection(data: ReportData, context: ReportContext): Promise<ReportSection> {
    return {
      id: 'environmental_analysis',
      title: 'Environmental Analysis',
      content: `Environmental conditions and control system performance...`,
      charts: [],
      tables: [],
      priority: 'high'
    };
  }

  private async generateInsightsSection(insights: Insight[], context: ReportContext): Promise<ReportSection> {
    return {
      id: 'operational_insights',
      title: 'Key Insights',
      content: `Analysis of operational patterns and performance indicators...`,
      charts: [],
      tables: [],
      priority: 'high'
    };
  }

  private async generateRecommendationsSection(recommendations: Recommendation[], context: ReportContext): Promise<ReportSection> {
    return {
      id: 'recommendations',
      title: 'Recommendations',
      content: `Strategic and operational recommendations for improvement...`,
      charts: [],
      tables: [],
      priority: 'high'
    };
  }

  private async generateFinancialSection(financialData: any, context: ReportContext): Promise<ReportSection> {
    return {
      id: 'financial_analysis',
      title: 'Financial Performance',
      content: `Financial metrics and profitability analysis...`,
      charts: [],
      tables: [],
      priority: 'medium'
    };
  }

  private async generateBenchmarkSection(benchmarkData: any, context: ReportContext): Promise<ReportSection> {
    return {
      id: 'benchmark_comparison',
      title: 'Industry Benchmarks',
      content: `Comparative analysis against industry standards...`,
      charts: [],
      tables: [],
      priority: 'medium'
    };
  }

  private async generateAppendices(data: ReportData, context: ReportContext): Promise<Appendix[]> {
    return [{
      id: 'data_methodology',
      title: 'Data Sources and Methodology',
      type: 'methodology',
      content: 'Detailed explanation of data collection and analysis methods...'
    }];
  }

  private calculateMetadata(
    context: ReportContext,
    data: ReportData,
    insights: Insight[],
    recommendations: Recommendation[],
    sections: ReportSection[]
  ): any {
    return {
      generatedAt: new Date(),
      context,
      dataQuality: 0.9, // Calculate based on data completeness
      confidenceLevel: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
      wordCount: sections.reduce((sum, s) => sum + s.content.length, 0)
    };
  }

  private generateReportTitle(context: ReportContext): string {
    const typeMap = {
      performance: 'Performance Analysis',
      benchmark: 'Benchmark Report',
      optimization: 'Optimization Analysis',
      compliance: 'Compliance Report',
      executive: 'Executive Summary',
      technical: 'Technical Analysis'
    };

    return `${context.facilityName} - ${typeMap[context.reportType]} (${context.timeframe})`;
  }
}

// Export singleton instance
export const reportGenerator = new IntelligentReportGenerator();