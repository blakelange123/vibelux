import Anthropic from '@anthropic-ai/sdk';

// Cost-optimized Claude service with caching and rate limiting
export class OptimizedClaudeService {
  private static instance: OptimizedClaudeService;
  private anthropic: Anthropic | null = null;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour cache
  private requestCount = 0;
  private monthlyLimit = 1000; // Configurable monthly limit
  
  private constructor() {}
  
  static getInstance(): OptimizedClaudeService {
    if (!OptimizedClaudeService.instance) {
      OptimizedClaudeService.instance = new OptimizedClaudeService();
    }
    return OptimizedClaudeService.instance;
  }

  private initializeClient() {
    if (!this.anthropic && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  private getCacheKey(type: string, data: any): string {
    return `${type}:${JSON.stringify(data)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean old cache entries
    if (this.cache.size > 100) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private async checkRateLimit(): Promise<boolean> {
    // Simple rate limiting - in production use Redis
    if (this.requestCount >= this.monthlyLimit) {
      console.warn('⚠️ Monthly AI request limit reached');
      return false;
    }
    return true;
  }

  // Cost-effective cultivation advice using templates
  async getCultivationAdvice(data: {
    strain: string;
    growthStage: string;
    issue?: string;
    metrics: any;
  }): Promise<any> {
    // Check cache first
    const cacheKey = this.getCacheKey('cultivation', data);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Use local knowledge base first
    const localAdvice = this.getLocalCultivationAdvice(data);
    if (localAdvice && !data.issue) {
      return localAdvice;
    }

    // Only call AI for complex issues
    if (!await this.checkRateLimit()) {
      return this.getFallbackResponse('cultivation');
    }

    try {
      this.initializeClient();
      if (!this.anthropic) throw new Error('AI service not configured');

      // Use cheaper, faster model for simple queries
      const model = data.issue ? 'claude-3-opus-20240229' : 'claude-3-haiku-20240307';
      
      // Concise prompt to reduce tokens
      const prompt = `Cannabis cultivation advice:
Strain: ${data.strain}
Stage: ${data.growthStage}
${data.issue ? `Issue: ${data.issue}` : ''}
Metrics: Temp ${data.metrics.temperature}°F, RH ${data.metrics.humidity}%, PPFD ${data.metrics.ppfd}

Provide 3 specific, actionable recommendations. Be concise.`;

      const response = await this.anthropic.messages.create({
        model,
        max_tokens: 500, // Limit response length
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }]
      });

      this.requestCount++;
      
      const result = this.parseResponse(response.content[0]);
      this.setCache(cacheKey, result);
      
      
      return result;
    } catch (error) {
      console.error('AI error:', error);
      return this.getFallbackResponse('cultivation');
    }
  }

  // Local knowledge base for common scenarios (no AI cost)
  private getLocalCultivationAdvice(data: any): any {
    const { strain, growthStage, metrics } = data;
    const { temperature, humidity, ppfd } = metrics;

    const recommendations = [];
    let confidence = 0.95;

    // Temperature checks
    if (growthStage === 'flowering') {
      if (temperature > 80) {
        recommendations.push('Reduce temperature to 75-78°F to preserve terpenes and prevent foxtailing');
      } else if (temperature < 65) {
        recommendations.push('Increase temperature to 68-75°F to maintain metabolic rates');
      }
    } else if (growthStage === 'vegetative') {
      if (temperature > 85) {
        recommendations.push('Lower temperature to 75-82°F for optimal growth rate');
      }
    }

    // Humidity checks
    const idealHumidity = {
      seedling: [65, 70],
      vegetative: [45, 65],
      flowering: [40, 50],
      harvest: [30, 40]
    };

    const [minRH, maxRH] = idealHumidity[growthStage] || [45, 65];
    if (humidity < minRH) {
      recommendations.push(`Increase humidity to ${minRH}-${maxRH}% for ${growthStage} stage`);
    } else if (humidity > maxRH) {
      recommendations.push(`Reduce humidity to ${minRH}-${maxRH}% to prevent mold/mildew`);
    }

    // Light intensity checks
    const idealPPFD = {
      seedling: [100, 300],
      vegetative: [400, 600],
      flowering: [600, 900]
    };

    const [minPPFD, maxPPFD] = idealPPFD[growthStage] || [400, 900];
    if (ppfd < minPPFD) {
      recommendations.push(`Increase light intensity to ${minPPFD}-${maxPPFD} PPFD for optimal photosynthesis`);
    } else if (ppfd > maxPPFD) {
      recommendations.push(`Reduce light intensity to ${maxPPFD} PPFD to prevent light stress`);
    }

    // Add strain-specific advice
    if (strain.toLowerCase().includes('kush') && growthStage === 'flowering') {
      recommendations.push('Kush strains benefit from cooler nights (10°F drop) in late flowering');
    }

    return {
      analysis: `Based on standard cultivation parameters for ${strain} in ${growthStage} stage.`,
      recommendations: recommendations.slice(0, 3),
      confidence,
      source: 'local_knowledge_base',
      cost: 0
    };
  }

  // Fallback responses when AI is unavailable
  private getFallbackResponse(type: string): any {
    const fallbacks = {
      cultivation: {
        analysis: 'Based on general cultivation best practices.',
        recommendations: [
          'Maintain stable environmental conditions within optimal ranges',
          'Monitor plants daily for signs of stress or deficiency',
          'Follow manufacturer guidelines for nutrient application'
        ],
        confidence: 0.7,
        source: 'fallback',
        cost: 0
      },
      energy: {
        analysis: 'General energy efficiency recommendations.',
        recommendations: [
          'Schedule high-power equipment during off-peak hours',
          'Ensure all equipment is properly maintained for efficiency',
          'Consider LED lighting upgrades for long-term savings'
        ],
        confidence: 0.7,
        source: 'fallback',
        cost: 0
      }
    };

    return fallbacks[type] || fallbacks.cultivation;
  }

  // Parse AI response safely
  private parseResponse(content: any): any {
    if (content.type !== 'text') return this.getFallbackResponse('cultivation');
    
    const text = content.text;
    const recommendations = text.match(/\d\.\s*([^\n]+)/g)?.map(r => r.replace(/^\d\.\s*/, '')) || [];
    
    return {
      analysis: text,
      recommendations: recommendations.slice(0, 3),
      confidence: 0.9,
      source: 'ai',
      timestamp: new Date().toISOString()
    };
  }

  // Estimate API costs
  private estimateCost(model: string, prompt: string, maxTokens: number): string {
    const costs = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 }, // per 1K tokens
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 } // much cheaper!
    };

    const modelCost = costs[model] || costs['claude-3-haiku-20240307'];
    const inputTokens = prompt.length / 4; // rough estimate
    const outputTokens = maxTokens * 0.8; // assume 80% usage
    
    const totalCost = (inputTokens / 1000 * modelCost.input) + (outputTokens / 1000 * modelCost.output);
    return totalCost.toFixed(4);
  }

  // Get usage statistics
  getUsageStats(): any {
    return {
      requestsThisMonth: this.requestCount,
      monthlyLimit: this.monthlyLimit,
      remainingRequests: Math.max(0, this.monthlyLimit - this.requestCount),
      cacheHitRate: this.cache.size > 0 ? `${Math.round(this.cache.size / (this.cache.size + this.requestCount) * 100)}%` : '0%',
      estimatedMonthlyCost: `$${(this.requestCount * 0.02).toFixed(2)}` // Average cost per request
    };
  }
}

export const optimizedAI = OptimizedClaudeService.getInstance();