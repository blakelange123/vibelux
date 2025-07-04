import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface AIAnalysisRequest {
  type: 'cultivation' | 'energy' | 'business' | 'compliance' | 'technical';
  context: Record<string, any>;
  question?: string;
  format?: 'detailed' | 'summary' | 'recommendations';
}

export interface AIAnalysisResponse {
  analysis: string;
  recommendations?: string[];
  confidence: number;
  insights?: Record<string, any>;
  nextSteps?: string[];
}

export class ClaudeAIService {
  private static instance: ClaudeAIService;
  
  private constructor() {}
  
  static getInstance(): ClaudeAIService {
    if (!ClaudeAIService.instance) {
      ClaudeAIService.instance = new ClaudeAIService();
    }
    return ClaudeAIService.instance;
  }

  /**
   * Analyze cultivation data and provide AI insights
   */
  async analyzeCultivationData(data: {
    environmentalData: any;
    yieldHistory: any;
    currentConditions: any;
    strain: string;
  }): Promise<AIAnalysisResponse> {
    try {
      const prompt = `
        As an expert cultivation advisor, analyze the following growing conditions and provide insights:
        
        Strain: ${data.strain}
        Current Environmental Conditions: ${JSON.stringify(data.currentConditions, null, 2)}
        Recent Yield History: ${JSON.stringify(data.yieldHistory, null, 2)}
        
        Please provide:
        1. Analysis of current growing conditions
        2. Specific recommendations for optimization
        3. Predicted impact on yield and quality
        4. Risk factors to monitor
        5. Next steps for improvement
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error analyzing cultivation data:', error);
      throw error;
    }
  }

  /**
   * Optimize energy usage patterns using AI
   */
  async optimizeEnergyUsage(data: {
    currentUsage: any;
    historicalData: any;
    facilityLayout: any;
    equipmentList: any;
    utilityRates: any;
  }): Promise<AIAnalysisResponse> {
    try {
      const prompt = `
        As an energy optimization expert for indoor cultivation facilities, analyze the following energy data:
        
        Current Usage Pattern: ${JSON.stringify(data.currentUsage, null, 2)}
        Historical Data: ${JSON.stringify(data.historicalData, null, 2)}
        Utility Rate Structure: ${JSON.stringify(data.utilityRates, null, 2)}
        
        Provide:
        1. Energy waste identification
        2. Peak demand reduction strategies
        3. Equipment scheduling optimization
        4. Cost savings opportunities
        5. ROI for recommended changes
        6. Implementation priority list
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.6,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error optimizing energy usage:', error);
      throw error;
    }
  }

  /**
   * Generate business insights and recommendations
   */
  async generateBusinessInsights(data: {
    financialMetrics: any;
    operationalKPIs: any;
    marketConditions: any;
    competitorAnalysis?: any;
  }): Promise<AIAnalysisResponse> {
    try {
      const prompt = `
        As a cannabis business consultant, analyze the following business metrics:
        
        Financial Performance: ${JSON.stringify(data.financialMetrics, null, 2)}
        Operational KPIs: ${JSON.stringify(data.operationalKPIs, null, 2)}
        Market Conditions: ${JSON.stringify(data.marketConditions, null, 2)}
        
        Provide:
        1. Business health assessment
        2. Growth opportunities
        3. Cost reduction strategies
        4. Market positioning recommendations
        5. Risk mitigation strategies
        6. 90-day action plan
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error generating business insights:', error);
      throw error;
    }
  }

  /**
   * Analyze compliance requirements and provide guidance
   */
  async analyzeCompliance(data: {
    facilityType: string;
    location: string;
    currentPractices: any;
    upcomingAudits: any;
    historicalIssues?: any;
  }): Promise<AIAnalysisResponse> {
    try {
      const prompt = `
        As a cannabis compliance expert, review the following facility compliance status:
        
        Facility Type: ${data.facilityType}
        Location: ${data.location}
        Current Practices: ${JSON.stringify(data.currentPractices, null, 2)}
        Upcoming Audits: ${JSON.stringify(data.upcomingAudits, null, 2)}
        
        Provide:
        1. Compliance gap analysis
        2. Priority compliance issues
        3. Audit preparation checklist
        4. Documentation requirements
        5. Best practices recommendations
        6. Timeline for implementation
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error analyzing compliance:', error);
      throw error;
    }
  }

  /**
   * Provide technical troubleshooting assistance
   */
  async troubleshootIssue(data: {
    issueType: string;
    symptoms: string[];
    affectedSystems: string[];
    timeline: string;
    attemptedSolutions?: string[];
  }): Promise<AIAnalysisResponse> {
    try {
      const prompt = `
        As a cultivation facility technical expert, help troubleshoot the following issue:
        
        Issue Type: ${data.issueType}
        Symptoms: ${data.symptoms.join(', ')}
        Affected Systems: ${data.affectedSystems.join(', ')}
        Timeline: ${data.timeline}
        ${data.attemptedSolutions ? `Attempted Solutions: ${data.attemptedSolutions.join(', ')}` : ''}
        
        Provide:
        1. Root cause analysis
        2. Step-by-step troubleshooting guide
        3. Immediate mitigation steps
        4. Long-term solutions
        5. Prevention strategies
        6. When to escalate to professionals
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1500,
        temperature: 0.6,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error troubleshooting issue:', error);
      throw error;
    }
  }

  /**
   * Generate custom reports with AI insights
   */
  async generateReport(data: {
    reportType: string;
    timeRange: string;
    metrics: any;
    audience: 'executive' | 'technical' | 'investor' | 'regulatory';
  }): Promise<string> {
    try {
      const prompt = `
        Generate a professional ${data.reportType} report for ${data.audience} audience:
        
        Time Period: ${data.timeRange}
        Key Metrics: ${JSON.stringify(data.metrics, null, 2)}
        
        Format the report with:
        1. Executive summary
        2. Key findings
        3. Data analysis
        4. Recommendations
        5. Next steps
        
        Use appropriate tone and detail level for ${data.audience} audience.
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 3000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Interactive Q&A for facility operations
   */
  async askOperationsQuestion(data: {
    question: string;
    context: any;
    facilityData?: any;
  }): Promise<string> {
    try {
      const prompt = `
        As a cultivation operations expert, answer the following question:
        
        Question: ${data.question}
        
        Context: ${JSON.stringify(data.context, null, 2)}
        ${data.facilityData ? `Facility Data: ${JSON.stringify(data.facilityData, null, 2)}` : ''}
        
        Provide a clear, actionable answer with specific recommendations when applicable.
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Error answering operations question:', error);
      throw error;
    }
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(content: string): AIAnalysisResponse {
    // Extract recommendations if they exist
    const recommendationsMatch = content.match(/recommendations?:?\s*([\s\S]*?)(?:\n\n|$)/i);
    const recommendations = recommendationsMatch 
      ? recommendationsMatch[1].split('\n').filter(r => r.trim()).map(r => r.replace(/^[-•*]\s*/, '').trim())
      : [];

    // Extract next steps if they exist
    const nextStepsMatch = content.match(/next steps?:?\s*([\s\S]*?)(?:\n\n|$)/i);
    const nextSteps = nextStepsMatch
      ? nextStepsMatch[1].split('\n').filter(s => s.trim()).map(s => s.replace(/^[-•*]\s*/, '').trim())
      : [];

    // Calculate confidence based on response characteristics
    const confidence = content.includes('uncertain') || content.includes('may') || content.includes('might') 
      ? 0.7 
      : content.includes('likely') || content.includes('should')
      ? 0.85
      : 0.95;

    return {
      analysis: content,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      confidence,
      nextSteps: nextSteps.length > 0 ? nextSteps : undefined
    };
  }

  /**
   * Stream real-time insights during critical events
   */
  async *streamRealTimeInsights(data: {
    eventType: 'emergency' | 'optimization' | 'monitoring';
    parameters: any;
  }): AsyncGenerator<string> {
    try {
      const stream = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.6,
        stream: true,
        messages: [{
          role: 'user',
          content: `Provide real-time ${data.eventType} guidance for: ${JSON.stringify(data.parameters)}`
        }]
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      console.error('Error streaming insights:', error);
      throw error;
    }
  }
}

export const claudeAI = ClaudeAIService.getInstance();