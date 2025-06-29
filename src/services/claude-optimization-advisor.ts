/**
 * Claude Optimization Advisor
 * Uses Claude AI to provide intelligent optimization recommendations
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

interface OptimizationContext {
  zoneId: string;
  zoneName: string;
  cropType: string;
  growthStage: string;
  currentConditions: {
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    currentDLI: number;
    targetDLI: number;
    intensity: number;
    photoperiod: number;
  };
  historicalData: {
    last7DaysAvgSavings: number;
    bestPerformingHours: number[];
    typicalPeakDemand: number;
    previousOptimizations: any[];
  };
  constraints: {
    minIntensity: number;
    maxIntensity: number;
    criticalPhotoperiod: boolean;
    maxDimming: number;
  };
  economicFactors: {
    currentRate: number;
    peakRate: number;
    offPeakRate: number;
    demandCharge: number;
    monthlyBudget: number;
  };
}

interface ClaudeRecommendation {
  recommendedIntensity: number;
  confidence: number;
  reasoning: string;
  potentialSavings: number;
  risks: string[];
  alternativeStrategies: string[];
  longTermSuggestions: string[];
}

export class ClaudeOptimizationAdvisor {
  private anthropic: Anthropic;
  private static instance: ClaudeOptimizationAdvisor;
  
  // Cache to avoid excessive API calls
  private recommendationCache: Map<string, {
    recommendation: ClaudeRecommendation;
    timestamp: number;
  }> = new Map();
  
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_MONTHLY_CALLS = 10000; // API limit management
  private monthlyCallCount = 0;

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  static getInstance(): ClaudeOptimizationAdvisor {
    if (!ClaudeOptimizationAdvisor.instance) {
      ClaudeOptimizationAdvisor.instance = new ClaudeOptimizationAdvisor();
    }
    return ClaudeOptimizationAdvisor.instance;
  }

  /**
   * Get optimization recommendation from Claude
   */
  async getOptimizationRecommendation(
    context: OptimizationContext
  ): Promise<ClaudeRecommendation | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(context);
      const cached = this.recommendationCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.recommendation;
      }
      
      // Check API limits
      if (this.monthlyCallCount >= this.MAX_MONTHLY_CALLS) {
        console.warn('Claude API monthly limit reached');
        return null;
      }
      
      // Prepare the prompt
      const prompt = this.buildOptimizationPrompt(context);
      
      // Call Claude - Always use the best model
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229', // Always use Opus for best results
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent optimization
        system: `You are an expert agricultural lighting optimization system. Your goal is to maximize energy savings while ensuring crop health and productivity. You must be extremely careful with cannabis flowering photoperiods (exactly 12/12) and never recommend changes that could harm crops. Provide specific, actionable recommendations.`,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      this.monthlyCallCount++;
      
      // Parse Claude's response
      const recommendation = this.parseClaudeResponse(response.content[0].text);
      
      // Cache the recommendation
      this.recommendationCache.set(cacheKey, {
        recommendation,
        timestamp: Date.now()
      });
      
      // Log the recommendation
      await this.logRecommendation(context, recommendation);
      
      return recommendation;
      
    } catch (error) {
      console.error('Claude optimization error:', error);
      return null;
    }
  }

  /**
   * Build optimization prompt for Claude
   */
  private buildOptimizationPrompt(context: OptimizationContext): string {
    return `
    Please analyze this grow room lighting optimization scenario and provide specific recommendations:
    
    CURRENT SITUATION:
    - Zone: ${context.zoneName}
    - Crop: ${context.cropType} (${context.growthStage} stage)
    - Current Intensity: ${context.currentConditions.intensity}%
    - Temperature: ${context.currentConditions.temperature}°C
    - Humidity: ${context.currentConditions.humidity}%
    - CO2: ${context.currentConditions.co2} ppm
    - VPD: ${context.currentConditions.vpd} kPa
    - Current DLI: ${context.currentConditions.currentDLI} mol/m²/d
    - Target DLI: ${context.currentConditions.targetDLI} mol/m²/d
    - Photoperiod: ${context.currentConditions.photoperiod} hours
    
    CONSTRAINTS:
    - Minimum Intensity: ${context.constraints.minIntensity}%
    - Maximum Intensity: ${context.constraints.maxIntensity}%
    - Critical Photoperiod: ${context.constraints.criticalPhotoperiod ? 'YES - DO NOT CHANGE TIMING' : 'No'}
    - Max Dimming Allowed: ${context.constraints.maxDimming}%
    
    ECONOMIC FACTORS:
    - Current Electricity Rate: $${context.economicFactors.currentRate}/kWh
    - Peak Rate (2pm-7pm): $${context.economicFactors.peakRate}/kWh
    - Off-Peak Rate: $${context.economicFactors.offPeakRate}/kWh
    - Demand Charge: $${context.economicFactors.demandCharge}/kW
    
    HISTORICAL PERFORMANCE:
    - Last 7 Days Avg Savings: ${context.historicalData.last7DaysAvgSavings}%
    - Best Performing Hours: ${context.historicalData.bestPerformingHours.join(', ')}
    - Typical Peak Demand: ${context.historicalData.typicalPeakDemand} kW
    
    Please provide:
    1. Recommended intensity setting (as a percentage)
    2. Confidence level (0-100)
    3. Clear reasoning for your recommendation
    4. Estimated savings in dollars per hour
    5. Any risks to consider
    6. Alternative strategies if the primary recommendation fails
    7. Long-term optimization suggestions
    
    Format your response as JSON with these exact keys:
    {
      "recommendedIntensity": <number>,
      "confidence": <number>,
      "reasoning": "<string>",
      "potentialSavings": <number>,
      "risks": ["<string>", ...],
      "alternativeStrategies": ["<string>", ...],
      "longTermSuggestions": ["<string>", ...]
    }
    `;
  }

  /**
   * Parse Claude's response into structured format
   */
  private parseClaudeResponse(response: string): ClaudeRecommendation {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
    }
    
    // Fallback parsing if JSON extraction fails
    return {
      recommendedIntensity: 100,
      confidence: 50,
      reasoning: 'Failed to parse AI response - maintaining current settings for safety',
      potentialSavings: 0,
      risks: ['AI parsing error - manual review recommended'],
      alternativeStrategies: [],
      longTermSuggestions: []
    };
  }

  /**
   * Generate cache key for recommendations
   */
  private getCacheKey(context: OptimizationContext): string {
    const hour = new Date().getHours();
    return `${context.zoneId}-${hour}-${context.cropType}-${context.growthStage}-${Math.round(context.currentConditions.temperature)}`;
  }

  /**
   * Log recommendation for analysis
   */
  private async logRecommendation(
    context: OptimizationContext,
    recommendation: ClaudeRecommendation
  ) {
    try {
      await prisma.optimization_events.create({
        data: {
          facility_id: context.zoneId,
          zone_id: context.zoneId,
          event_time: new Date(),
          action_type: 'ai_recommendation',
          action_value: {
            context: context,
            recommendation: recommendation,
            source: 'claude-3'
          },
          crop_type: context.cropType,
          growth_stage: context.growthStage,
          safety_score: recommendation.confidence,
          baseline_power_kw: 0,
          optimized_power_kw: 0,
          power_saved_kw: recommendation.potentialSavings,
          energy_rate: context.economicFactors.currentRate
        }
      });
    } catch (error) {
      console.error('Failed to log Claude recommendation:', error);
    }
  }

  /**
   * Get insights from historical Claude recommendations
   */
  async getHistoricalInsights(zoneId: string): Promise<{
    averageAccuracy: number;
    bestStrategies: string[];
    commonRisks: string[];
    improvementTrend: number;
  }> {
    const recommendations = await prisma.optimization_events.findMany({
      where: {
        zone_id: zoneId,
        action_type: 'ai_recommendation',
        event_time: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { event_time: 'desc' },
      take: 100
    });
    
    // Analyze recommendations
    const accuracies: number[] = [];
    const strategies: Map<string, number> = new Map();
    const risks: Map<string, number> = new Map();
    
    for (const rec of recommendations) {
      const data = rec.action_value as any;
      
      // Track accuracy if we have actual vs predicted
      if (data.actualSavings !== undefined) {
        const accuracy = 1 - Math.abs(data.recommendation.potentialSavings - data.actualSavings) / 
          Math.max(data.recommendation.potentialSavings, data.actualSavings);
        accuracies.push(accuracy);
      }
      
      // Count strategies
      data.recommendation.alternativeStrategies?.forEach((strategy: string) => {
        strategies.set(strategy, (strategies.get(strategy) || 0) + 1);
      });
      
      // Count risks
      data.recommendation.risks?.forEach((risk: string) => {
        risks.set(risk, (risks.get(risk) || 0) + 1);
      });
    }
    
    // Calculate improvement trend
    const recentAccuracy = accuracies.slice(0, 10).reduce((a, b) => a + b, 0) / Math.min(10, accuracies.length);
    const olderAccuracy = accuracies.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, accuracies.slice(-10).length);
    const improvementTrend = ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100;
    
    return {
      averageAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length * 100,
      bestStrategies: Array.from(strategies.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([strategy]) => strategy),
      commonRisks: Array.from(risks.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([risk]) => risk),
      improvementTrend
    };
  }

  /**
   * Reset monthly call count (call this via cron job monthly)
   */
  resetMonthlyCounter() {
    this.monthlyCallCount = 0;
    this.recommendationCache.clear();
  }
}

// Export singleton
export const claudeOptimizationAdvisor = ClaudeOptimizationAdvisor.getInstance();