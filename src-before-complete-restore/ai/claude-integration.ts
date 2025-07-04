import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface QueryContext {
  facilityData: any;
  sensorData: any[];
  benchmarkData: any;
  userRole: string;
  timeframe: string;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources: string[];
  suggestedActions?: string[];
  relatedQuestions?: string[];
}

export class ClaudeVibeLuxAssistant {
  
  // 1. Natural Language Data Queries
  async answerDataQuery(query: string, context: QueryContext): Promise<AIResponse> {
    const prompt = `You are VibeLux AI, an expert cultivation assistant for controlled environment agriculture. 

FACILITY CONTEXT:
- Facility: ${context.facilityData.name}
- Size: ${context.facilityData.size} sq ft
- Type: ${context.facilityData.type}
- Crops: ${context.facilityData.cropTypes?.join(', ') || 'Various'}

RECENT SENSOR DATA:
${this.formatSensorData(context.sensorData)}

BENCHMARK PERFORMANCE:
${this.formatBenchmarkData(context.benchmarkData)}

USER QUERY: "${query}"

Please provide a comprehensive answer that:
1. Directly answers the user's question
2. Uses specific data from their facility
3. Compares to industry benchmarks when relevant
4. Suggests 2-3 actionable next steps
5. Recommends related questions they might ask

Format your response as JSON:
{
  "answer": "detailed answer with specific data points",
  "confidence": 0.95,
  "sources": ["sensor readings", "benchmark data", "industry standards"],
  "suggestedActions": ["action 1", "action 2", "action 3"],
  "relatedQuestions": ["question 1", "question 2", "question 3"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      return JSON.parse(response.content[0].text);
    } catch (error) {
      return {
        answer: response.content[0].text,
        confidence: 0.8,
        sources: ['AI analysis'],
      };
    }
  }

  // 2. Problem Diagnosis & Solutions
  async diagnoseIssue(symptoms: string[], context: QueryContext): Promise<{
    diagnosis: string;
    likelihood: number;
    causes: string[];
    solutions: Array<{
      solution: string;
      difficulty: 'easy' | 'medium' | 'hard';
      timeframe: string;
      cost: string;
      effectiveness: number;
    }>;
    prevention: string[];
  }> {
    const prompt = `You are an expert plant diagnostician for controlled environment agriculture.

FACILITY DATA:
- Environment: ${context.facilityData.type}
- Current conditions: ${this.formatCurrentConditions(context.sensorData)}
- Recent performance: ${this.formatPerformanceMetrics(context.benchmarkData)}

REPORTED SYMPTOMS:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Based on these symptoms and facility conditions, provide your expert diagnosis in JSON format:
{
  "diagnosis": "Most likely issue with confidence explanation",
  "likelihood": 0.85,
  "causes": ["root cause 1", "contributing factor 2", "environmental factor 3"],
  "solutions": [
    {
      "solution": "Primary recommended solution",
      "difficulty": "medium",
      "timeframe": "2-3 days",
      "cost": "$100-500",
      "effectiveness": 0.9
    }
  ],
  "prevention": ["prevention tip 1", "monitoring suggestion 2"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  // 3. Intelligent Report Narratives
  async generateReportNarrative(reportData: any, audienceType: 'technical' | 'executive' | 'investor'): Promise<{
    summary: string;
    keyInsights: string[];
    recommendations: string[];
    nextSteps: string[];
  }> {
    const audienceContext = {
      technical: "detailed technical analysis for cultivation managers and growers",
      executive: "high-level business insights for C-suite executives",
      investor: "financial performance and growth metrics for investors"
    };

    const prompt = `You are writing a ${audienceContext[audienceType]} report for VibeLux.

REPORT DATA:
${JSON.stringify(reportData, null, 2)}

Create a compelling narrative that:
1. Summarizes performance in language appropriate for ${audienceType} audience
2. Highlights the most important insights
3. Provides actionable recommendations
4. Outlines clear next steps

Format as JSON:
{
  "summary": "2-3 paragraph executive summary",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "nextSteps": ["step 1", "step 2", "step 3"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  // 4. Anomaly Explanation
  async explainAnomaly(anomalyData: {
    metric: string;
    value: number;
    expectedRange: [number, number];
    timestamp: Date;
    context: any;
  }): Promise<{
    explanation: string;
    possibleCauses: string[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string[];
    monitoring: string[];
  }> {
    const prompt = `You are analyzing an anomaly detected in a controlled environment agriculture facility.

ANOMALY DETAILS:
- Metric: ${anomalyData.metric}
- Actual value: ${anomalyData.value}
- Expected range: ${anomalyData.expectedRange[0]} - ${anomalyData.expectedRange[1]}
- Time: ${anomalyData.timestamp}
- Facility context: ${JSON.stringify(anomalyData.context)}

Provide expert analysis in JSON format:
{
  "explanation": "Clear explanation of what this anomaly means",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "urgency": "medium",
  "recommendedActions": ["immediate action", "short-term fix", "long-term solution"],
  "monitoring": ["what to watch", "additional sensors needed"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  // 5. Compliance Assistant
  async checkCompliance(facilityData: any, regulations: string[]): Promise<{
    overallStatus: 'compliant' | 'issues' | 'non-compliant';
    checkResults: Array<{
      regulation: string;
      status: 'pass' | 'warning' | 'fail';
      details: string;
      requiredActions?: string[];
    }>;
    recommendations: string[];
    deadlines: Array<{
      task: string;
      deadline: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }> {
    const prompt = `You are a cannabis compliance expert reviewing a facility for regulatory adherence.

FACILITY DATA:
${JSON.stringify(facilityData, null, 2)}

REGULATIONS TO CHECK:
${regulations.join('\n')}

Perform compliance analysis and return JSON:
{
  "overallStatus": "compliant",
  "checkResults": [
    {
      "regulation": "Seed-to-sale tracking",
      "status": "pass",
      "details": "All plants properly tagged and tracked"
    }
  ],
  "recommendations": ["action 1", "action 2"],
  "deadlines": [
    {
      "task": "Update inventory records",
      "deadline": "2024-01-15",
      "priority": "high"
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  // 6. Equipment Optimization Advisor
  async analyzeEquipmentPerformance(equipmentData: any[], performanceMetrics: any): Promise<{
    analysis: string;
    underperforming: Array<{
      equipment: string;
      issues: string[];
      impact: string;
      solutions: string[];
    }>;
    upgrades: Array<{
      equipment: string;
      recommendation: string;
      cost: string;
      roi: string;
      priority: number;
    }>;
    maintenance: Array<{
      equipment: string;
      schedule: string;
      tasks: string[];
    }>;
  }> {
    const prompt = `You are an equipment optimization specialist for indoor agriculture.

EQUIPMENT INVENTORY:
${JSON.stringify(equipmentData, null, 2)}

PERFORMANCE METRICS:
${JSON.stringify(performanceMetrics, null, 2)}

Analyze equipment performance and provide recommendations in JSON format:
{
  "analysis": "Overall equipment performance assessment",
  "underperforming": [
    {
      "equipment": "LED Fixture A",
      "issues": ["efficiency below 2.5 μmol/J", "uneven light distribution"],
      "impact": "15% yield reduction in Zone 1",
      "solutions": ["Replace with new LED", "Add supplemental lighting"]
    }
  ],
  "upgrades": [
    {
      "equipment": "HVAC System",
      "recommendation": "Upgrade to variable speed fans",
      "cost": "$15,000",
      "roi": "18 months",
      "priority": 8
    }
  ],
  "maintenance": [
    {
      "equipment": "LED Arrays",
      "schedule": "Monthly",
      "tasks": ["Clean lenses", "Check connections", "Monitor output"]
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  // 7. Market Intelligence
  async analyzeMarketTrends(marketData: any[], facilityMetrics: any): Promise<{
    trends: string[];
    opportunities: Array<{
      opportunity: string;
      potential: string;
      timeline: string;
      requirements: string[];
    }>;
    pricing: {
      currentPosition: string;
      recommendations: string[];
    };
    competitive: {
      advantages: string[];
      gaps: string[];
      strategies: string[];
    };
  }> {
    const prompt = `You are a cannabis market analyst providing strategic insights.

MARKET DATA:
${JSON.stringify(marketData, null, 2)}

FACILITY PERFORMANCE:
${JSON.stringify(facilityMetrics, null, 2)}

Provide market intelligence in JSON format:
{
  "trends": ["trend 1", "trend 2", "trend 3"],
  "opportunities": [
    {
      "opportunity": "Premium indoor flower demand increasing",
      "potential": "$50K additional monthly revenue",
      "timeline": "6 months",
      "requirements": ["Quality certification", "Brand development"]
    }
  ],
  "pricing": {
    "currentPosition": "Premium tier - 15% above market average",
    "recommendations": ["Maintain premium positioning", "Develop ultra-premium line"]
  },
  "competitive": {
    "advantages": ["Superior quality", "Consistent supply"],
    "gaps": ["Limited product variety", "Higher costs"],
    "strategies": ["Expand strain portfolio", "Optimize operations"]
  }
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  // 8. Training Content Generator
  async generateTrainingContent(topic: string, skillLevel: 'beginner' | 'intermediate' | 'advanced', context: any): Promise<{
    content: {
      overview: string;
      sections: Array<{
        title: string;
        content: string;
        practicalTips: string[];
      }>;
      quiz: Array<{
        question: string;
        options: string[];
        correct: number;
        explanation: string;
      }>;
    };
    nextSteps: string[];
  }> {
    const prompt = `You are creating training content for cannabis cultivation professionals.

TOPIC: ${topic}
SKILL LEVEL: ${skillLevel}
FACILITY CONTEXT: ${JSON.stringify(context)}

Create comprehensive training material in JSON format:
{
  "content": {
    "overview": "Introduction to the topic",
    "sections": [
      {
        "title": "Section 1",
        "content": "Detailed explanation",
        "practicalTips": ["tip 1", "tip 2"]
      }
    ],
    "quiz": [
      {
        "question": "What is the optimal VPD for flowering cannabis?",
        "options": ["0.8-1.0 kPa", "1.0-1.2 kPa", "1.2-1.4 kPa", "1.4-1.6 kPa"],
        "correct": 1,
        "explanation": "1.0-1.2 kPa provides optimal transpiration during flowering"
      }
    ]
  },
  "nextSteps": ["Practice exercise", "Additional reading", "Advanced topics"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  // Helper methods
  private formatSensorData(sensorData: any[]): string {
    if (!sensorData || sensorData.length === 0) return "No recent sensor data available";
    
    const latest = sensorData.slice(-10);
    return latest.map(reading => 
      `${reading.sensorType}: ${reading.value}${reading.unit} at ${reading.timestamp}`
    ).join('\n');
  }

  private formatBenchmarkData(benchmarkData: any): string {
    if (!benchmarkData) return "No benchmark data available";
    
    return `
Yield: ${benchmarkData.metrics?.yieldPerSqFt || 'N/A'} lbs/sq ft
Energy: ${benchmarkData.metrics?.energyPerGram || 'N/A'} kWh/g
Quality: ${benchmarkData.metrics?.qualityScore || 'N/A'}/10
Revenue: $${benchmarkData.metrics?.revenuePerSqFt || 'N/A'}/sq ft`;
  }

  private formatCurrentConditions(sensorData: any[]): string {
    if (!sensorData || sensorData.length === 0) return "No current conditions available";
    
    const latest = sensorData.slice(-5);
    const byType = latest.reduce((acc, reading) => {
      acc[reading.sensorType] = reading.value;
      return acc;
    }, {});
    
    return Object.entries(byType)
      .map(([type, value]) => `${type}: ${value}`)
      .join(', ');
  }

  private formatPerformanceMetrics(benchmarkData: any): string {
    if (!benchmarkData) return "No performance data";
    
    const metrics = benchmarkData.metrics || {};
    return `Recent performance - Yield: ${metrics.yieldPerSqFt || 'N/A'}, Quality: ${metrics.qualityScore || 'N/A'}`;
  }
}

export const claudeAssistant = new ClaudeVibeLuxAssistant();